import inquirer from "inquirer";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);

type TemplateType = "resort" | "clinic" | "restaurant";

type PromptAnswers = {
  clientName: string;
  domain: string;
  templateType: TemplateType;
};

type ProvisioningRunRecord = {
  id: string;
  clientName: string;
  domain: string;
  templateType: TemplateType;
  status: "pending" | "success" | "failed";
  outputPath: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

const templateRepoMap: Record<TemplateType, string | undefined> = {
  resort: process.env.RESORT_TEMPLATE_REPO,
  clinic: process.env.CLINIC_TEMPLATE_REPO,
  restaurant: process.env.RESTAURANT_TEMPLATE_REPO
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canWriteRuns = Boolean(supabaseUrl && supabaseServiceRoleKey);
const localLogPath = path.resolve(process.cwd(), "provisioning-runs.log");

async function main() {
  const answers = await inquirer.prompt<PromptAnswers>([
    {
      type: "input",
      name: "clientName",
      message: "Client name",
      validate: (value: string) => (value.trim() ? true : "Client name is required")
    },
    {
      type: "input",
      name: "domain",
      message: "Domain",
      validate: (value: string) => (value.trim() ? true : "Domain is required")
    },
    {
      type: "list",
      name: "templateType",
      message: "Template type",
      choices: ["resort", "clinic", "restaurant"]
    }
  ]);

  const templateRepo = templateRepoMap[answers.templateType];
  if (!templateRepo) {
    throw new Error(`Missing template repo URL for ${answers.templateType}. Set the matching environment variable before provisioning.`);
  }

  const workspaceRoot = path.resolve(process.cwd(), "provisioned-sites");
  const projectFolder = path.join(workspaceRoot, createFolderSlug(answers.clientName));
  const startedAt = new Date().toISOString();
  const localRun = createLocalRunRecord(answers.clientName, answers.domain, answers.templateType, projectFolder, startedAt);
  await writeLocalRunLog(localRun);

  const dbRunId = await createProvisioningRunRecord(localRun);

  await mkdir(workspaceRoot, { recursive: true });
  try {
    await cloneTemplateRepo(templateRepo, projectFolder);
    await replacePlaceholders(projectFolder, answers.clientName, answers.domain);
    await initializeGit(projectFolder);

    const completedAt = new Date().toISOString();
    await updateProvisioningRunRecord(dbRunId, {
      status: "success",
      outputPath: projectFolder,
      errorMessage: null,
      completedAt
    });
    await writeLocalRunLog({
      ...localRun,
      status: "success",
      completedAt,
      errorMessage: null
    });

    console.log(`Provisioned ${answers.clientName} at ${projectFolder}`);
    console.log("Next: connect the folder to the target host and run the first deployment.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown provisioning error";
    const completedAt = new Date().toISOString();
    await updateProvisioningRunRecord(dbRunId, {
      status: "failed",
      outputPath: projectFolder,
      errorMessage,
      completedAt
    });
    await writeLocalRunLog({
      ...localRun,
      status: "failed",
      completedAt,
      errorMessage
    });
    throw error;
  }
}

function createFolderSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-client";
}

async function cloneTemplateRepo(repositoryUrl: string, destinationPath: string) {
  await execFileAsync("git", ["clone", repositoryUrl, destinationPath]);
}

async function initializeGit(projectPath: string) {
  await execFileAsync("git", ["init"], { cwd: projectPath });
}

function createLocalRunRecord(
  clientName: string,
  domain: string,
  templateType: TemplateType,
  outputPath: string,
  startedAt: string
): ProvisioningRunRecord {
  return {
    id: `${createFolderSlug(clientName)}-${Date.now()}`,
    clientName,
    domain,
    templateType,
    status: "pending",
    outputPath,
    errorMessage: null,
    startedAt,
    completedAt: null
  };
}

async function writeLocalRunLog(record: ProvisioningRunRecord) {
  const line = `${JSON.stringify(record)}\n`;
  await appendFile(localLogPath, line, "utf8");
}

async function createProvisioningRunRecord(record: ProvisioningRunRecord) {
  if (!canWriteRuns) {
    return null;
  }

  const supabase = createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey!);
  const { data, error } = await supabase
    .from("provisioning_runs")
    .insert({
      client_id: null,
      template_type: record.templateType,
      domain: record.domain,
      status: "pending",
      output_path: record.outputPath,
      error_message: null,
      started_at: record.startedAt
    })
    .select("id")
    .single();

  if (error) {
    console.error(`DB log write failed: ${error.message}`);
    return null;
  }

  return data?.id ?? null;
}

async function updateProvisioningRunRecord(
  id: string | null,
  input: {
    status: "pending" | "success" | "failed";
    outputPath: string;
    errorMessage: string | null;
    completedAt: string;
  }
) {
  if (!id || !canWriteRuns) {
    return;
  }

  const supabase = createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey!);
  const { error } = await supabase
    .from("provisioning_runs")
    .update({
      status: input.status,
      output_path: input.outputPath,
      error_message: input.errorMessage,
      completed_at: input.status === "pending" ? null : input.completedAt
    })
    .eq("id", id);

  if (error) {
    console.error(`DB log update failed: ${error.message}`);
  }
}

async function replacePlaceholders(directoryPath: string, clientName: string, domain: string) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await replacePlaceholders(entryPath, clientName, domain);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const contents = await readFile(entryPath, "utf8");
    const updatedContents = contents
      .replaceAll("{{CLIENT_NAME}}", clientName)
      .replaceAll("{{DOMAIN}}", domain);

    if (contents !== updatedContents) {
      await writeFile(entryPath, updatedContents, "utf8");
    }
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown provisioning error";
  console.error(message);
  process.exitCode = 1;
});