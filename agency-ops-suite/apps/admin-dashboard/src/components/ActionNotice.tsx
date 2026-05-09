type ActionNoticeProps = {
  ok?: string;
  err?: string;
};

const OK_MESSAGES: Record<string, string> = {
  client_created: "Client created successfully.",
  client_status_updated: "Client status updated.",
  client_deploy_readiness_updated: "Deploy readiness updated.",
  provisioning_triggered: "Provisioning run started.",
  billing_created: "Billing record created.",
  billing_updated: "Billing status updated.",
  billing_record_updated: "Billing record updated.",
  lead_created: "Lead created successfully.",
  lead_status_updated: "Lead status updated.",
  request_created: "Request created successfully.",
  request_status_updated: "Request status updated.",
  task_created: "Task created successfully.",
  task_updated: "Task updated successfully.",
  task_status_updated: "Task status updated.",
  asset_created: "Asset created successfully.",
  asset_updated: "Asset updated successfully.",
  domain_created: "Domain record created successfully.",
  domain_updated: "Domain record updated successfully.",
  maintenance_created: "Maintenance record created.",
  maintenance_updated: "Maintenance record updated."
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_client_input: "Please complete all required client fields with valid values.",
  client_create_failed: "Unable to create client. Please check database connection and permissions.",
  missing_client_id: "Missing client ID for status update.",
  client_status_update_failed: "Unable to update client status.",
  client_deploy_readiness_failed: "Unable to update deploy readiness.",
  invalid_provisioning_input: "Client ID and domain are required for provisioning.",
  provisioning_trigger_failed: "Unable to start provisioning run.",
  invalid_billing_input: "Please provide client and due date for billing.",
  billing_create_failed: "Unable to create billing record.",
  invalid_billing_update_input: "Billing update is missing required values.",
  missing_billing_id: "Missing billing ID for update.",
  billing_update_failed: "Unable to update billing status.",
  missing_lead_id: "Missing lead ID for status update.",
  invalid_lead_input: "Please provide lead name and business type.",
  lead_create_failed: "Unable to create lead.",
  lead_status_update_failed: "Unable to update lead status.",
  missing_request_id: "Missing request ID for status update.",
  invalid_request_input: "Please provide client, title, and description for the request.",
  request_create_failed: "Unable to create request.",
  request_status_update_failed: "Unable to update request status.",
  invalid_task_input: "Please provide a task title and description.",
  task_create_failed: "Unable to create task.",
  invalid_task_update_input: "Task update is missing required values.",
  missing_task_id: "Missing task ID for status update.",
  task_update_failed: "Unable to update task.",
  task_status_update_failed: "Unable to update task status.",
  invalid_asset_input: "Please provide an asset name and URL.",
  asset_create_failed: "Unable to create asset record.",
  invalid_asset_update_input: "Asset update is missing required values.",
  asset_update_failed: "Unable to update asset record.",
  invalid_domain_input: "Please provide a domain, registrar, hosting provider, and expiry date.",
  domain_create_failed: "Unable to create domain record.",
  invalid_domain_update_input: "Domain update is missing required values.",
  domain_update_failed: "Unable to update domain record.",
  invalid_maintenance_create_input: "Please provide valid maintenance values for the new record.",
  maintenance_create_failed: "Unable to create maintenance record.",
  invalid_maintenance_input: "Maintenance update values are invalid.",
  maintenance_update_failed: "Unable to update maintenance record."
};

export function ActionNotice({ ok, err }: ActionNoticeProps) {
  if (!ok && !err) {
    return null;
  }

  if (err) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {ERROR_MESSAGES[err] ?? "Action failed. Please try again."}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      {OK_MESSAGES[ok ?? ""] ?? "Action completed successfully."}
    </div>
  );
}