import { ActionNotice } from "@/components/ActionNotice";
import { getClients, getTasks } from "@/lib/db";
import { createTaskAction, updateTaskAction, updateTaskStatusAction } from "@/app/actions";

export default async function TasksPage({
  searchParams
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const [tasks, clients] = await Promise.all([getTasks(), getClients()]);
  const clientNamesById = new Map(clients.map((client) => [client.id, client.name]));
  const counts = {
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    done: tasks.filter((task) => task.status === "done").length
  };

  return (
    <section className="space-y-6">
      <ActionNotice ok={searchParams.ok} err={searchParams.err} />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-200">Tasks</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Internal tasks board</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Track lightweight internal work items with a simple status flow and optional client association.
        </p>

        <form action={createTaskAction} className="mt-6 grid gap-3 md:grid-cols-3">
          <select name="clientId" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <input required name="title" placeholder="Task title" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-2" />

          <textarea
            required
            name="description"
            placeholder="Task details"
            rows={3}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white md:col-span-3"
          />

          <input type="date" name="dueDate" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" />

          <select name="status" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
            <option value="todo">todo</option>
            <option value="in_progress">in progress</option>
            <option value="done">done</option>
          </select>

          <button type="submit" className="rounded-xl border border-accent-300 bg-accent-500/25 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500/40">
            Add task
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Todo</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.todo}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">In progress</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.inProgress}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Done</p>
          <p className="mt-2 text-3xl font-semibold text-white">{counts.done}</p>
        </article>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <form action={updateTaskStatusAction} className="inline-flex items-center gap-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <select name="status" defaultValue={task.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-xs text-white uppercase tracking-[0.15em]">
                    <option value="todo">todo</option>
                    <option value="in_progress">in progress</option>
                    <option value="done">done</option>
                  </select>
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:border-accent-300">
                    Update status
                  </button>
                </form>

                <form action={updateTaskAction} className="grid gap-2 md:grid-cols-4">
                  <input type="hidden" name="id" value={task.id} />
                  <input name="title" defaultValue={task.title} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white md:col-span-2" />
                  <input type="date" name="dueDate" defaultValue={task.dueDate ?? ""} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white" />
                  <select name="status" defaultValue={task.status} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white">
                    <option value="todo">todo</option>
                    <option value="in_progress">in progress</option>
                    <option value="done">done</option>
                  </select>
                  <textarea name="description" defaultValue={task.description} rows={3} className="rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white md:col-span-4" />
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-100 hover:border-accent-300 md:col-span-4">
                    Save task
                  </button>
                </form>

                <p className="text-sm text-slate-300">{task.description}</p>
              </div>

              <div className="text-sm text-slate-400 md:text-right">
                <p>Created: {task.createdAt}</p>
                <p className="mt-1">Due: {task.dueDate ?? "No due date"}</p>
                <p className="mt-1">Client: {task.clientId ? clientNamesById.get(task.clientId) ?? task.clientId : "Unassigned"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
