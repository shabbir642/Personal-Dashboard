"use client";

import { useMemo, useState } from "react";

import EmptyState from "../EmptyState";
import { Task, TaskPriority, TaskStatus } from "../../lib/types";

type SortField = "created_at" | "title" | "priority" | "status" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 6;

const priorityWeight: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export interface TasksTableProps {
  tasks: Task[];
  onRowClick: (taskId: number) => void;
}

export default function TasksTable({ tasks, onRowClick }: TasksTableProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const visibleTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);
      return matchesStatus && matchesPriority && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let value = 0;
      if (sortField === "title") {
        value = a.title.localeCompare(b.title);
      } else if (sortField === "priority") {
        value = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sortField === "status") {
        value = a.status.localeCompare(b.status);
      } else if (sortField === "start_date") {
        value = (a.start_date || "").localeCompare(b.start_date || "");
      } else if (sortField === "end_date") {
        value = (a.end_date || "").localeCompare(b.end_date || "");
      } else {
        value = a.created_at.localeCompare(b.created_at);
      }
      return sortDirection === "asc" ? value : -value;
    });
  }, [tasks, statusFilter, priorityFilter, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleTasks.slice(start, start + PAGE_SIZE);
  }, [visibleTasks, currentPage]);

  return (
    <>
      <div className="header-row">
        <h2>Tasks</h2>
        <div className="controls-grid">
          <label>
            Search
            <input
              value={searchTerm}
              placeholder="Search title/description"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <label>
            Status Filter
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | TaskStatus);
                setPage(1);
              }}
            >
              <option value="all">all</option>
              <option value="todo">todo</option>
              <option value="in-progress">in-progress</option>
              <option value="done">done</option>
            </select>
          </label>

          <label>
            Priority Filter
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as "all" | TaskPriority);
                setPage(1);
              }}
            >
              <option value="all">all</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>

          <label>
            Sort By
            <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
              <option value="created_at">created_at</option>
              <option value="title">title</option>
              <option value="priority">priority</option>
              <option value="status">status</option>
              <option value="start_date">start_date</option>
              <option value="end_date">end_date</option>
            </select>
          </label>

          <label>
            Direction
            <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value as SortDirection)}>
              <option value="asc">asc</option>
              <option value="desc">desc</option>
            </select>
          </label>
        </div>
      </div>

      {paginatedTasks.length === 0 ? (
        <EmptyState text="No tasks found for the current filters." />
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="clickable-row"
                    onClick={() => onRowClick(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onRowClick(task.id);
                    }}
                  >
                    <td>{task.title}</td>
                    <td>{task.description || "-"}</td>
                    <td>
                      <span className={`status-badge status-${task.status}`}>{task.status}</span>
                    </td>
                    <td>
                      <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td>{task.start_date || "-"}</td>
                    <td>{task.end_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              type="button"
              className="secondary-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="secondary-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
