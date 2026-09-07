import { useState, useRef, useEffect } from "react";
import { CheckCircle, CircleNotch } from "phosphor-react";
import { useAuth } from "../context/useAuth";
import { parseTasksFromMessage } from "../services/taskAgent";

const STATUS_LABELS = {
  open: "Open",
  assigned: "Assigned",
  done: "Done ✓",
};

function TaskCard({ task, currentUser, onAccept, onComplete, onRemove }) {
  return (
    <div className={`task-card bento-card${task.status === "done" ? " task-card--done" : ""}`}>
      <div className="task-card-header">
        <span className={`task-status task-status--${task.status}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <button
          className="task-remove"
          aria-label={`Remove task "${task.title}"`}
          onClick={() => onRemove(task.id)}
        >
          ×
        </button>
      </div>

      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      <div className="task-card-footer">
        <span className="task-card-meta">
          {task.status === "open" && `Added by ${task.createdBy}`}
          {task.status === "assigned" && `Accepted by ${task.assignedTo}`}
          {task.status === "done" && `Completed by ${task.assignedTo || task.createdBy}`}
        </span>
        <div className="task-card-actions">
          {task.status === "open" && (
            <button
              className="btn btn-primary task-action-btn"
              onClick={() => onAccept(task.id, currentUser)}
            >
              Accept →
            </button>
          )}
          {task.status === "assigned" && task.assignedTo === currentUser && (
            <button
              className="btn btn-secondary task-action-btn"
              onClick={() => onComplete(task.id)}
            >
              Mark done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksScreen({ useAppState }) {
  const { profile } = useAuth();
  const currentUser = profile?.username || "You";
  const { dest, tasks, addTasks, acceptTask, completeTask, removeTask } = useAppState;

  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  const logsQueue = useRef([]);
  const logsInterval = useRef(null);
  const logsEndRef = useRef(null);

  // Smooth out log streaming
  useEffect(() => {
    if (loading) {
      logsInterval.current = setInterval(() => {
        if (logsQueue.current.length > 0) {
          const nextLog = logsQueue.current.shift();
          setLogs(prev => [...prev, nextLog]);
        }
      }, 150);
    } else {
      clearInterval(logsInterval.current);
    }
    return () => clearInterval(logsInterval.current);
  }, [loading]);

  // Auto scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const openCount = tasks.filter((t) => t.status === "open").length;

  async function handleParse() {
    const trimmed = message.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setPreview(null);
    setLogs([]);
    logsQueue.current = [];
    try {
      const parsed = await parseTasksFromMessage(
        trimmed, 
        { destination: dest || "our destination" },
        (newLog) => {
          logsQueue.current.push(newLog);
        }
      );
      if (parsed.length === 0) {
        setError("No tasks found — try describing what still needs to be booked or organised.");
      } else {
        setPreview(parsed);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Check that the task agent is running.");
    } finally {
      setLoading(false);
      // Flush remaining logs instantly
      if (logsQueue.current.length > 0) {
        setLogs(prev => [...prev, ...logsQueue.current]);
        logsQueue.current = [];
      }
    }
  }

  function handleConfirm() {
    if (!preview) return;
    addTasks(preview, currentUser);
    setPreview(null);
    setLogs([]);
    setMessage("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleParse();
    }
  }

  return (
    <section className="screen active screen-tasks">
      <style>{`
        @keyframes custom-spin { 100% { transform: rotate(360deg); } }
        .spin-anim { animation: custom-spin 1s linear infinite; }
      `}</style>
      {/* ── Agent chat section ── */}
      <div className="tasks-agent-wrap">
        <div className="tasks-section-head">
          <h1 className="h-display" style={{ fontSize: 27 }}>Group Tasks</h1>
          <div className="eyebrow" style={{ marginTop: 4 }}>
            Tell the agent what still needs doing — it will create tasks for the group.
          </div>
        </div>

        <div className="bento-card tasks-agent-card">
          <div className="bx-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={20} weight="bold" /> Ask the task agent
          </div>
          <div className="bx-sub" style={{ marginTop: 4 }}>
            Describe what hasn't been done yet. The agent will extract actionable tasks.
          </div>

          <textarea
            className="task-input"
            rows={3}
            placeholder={`e.g. "The flight and hotel haven't been booked yet, and we still need to figure out transport."`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          {error && <div className="task-error">{error}</div>}

          {!preview && (
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 12 }}
              onClick={handleParse}
              disabled={loading || !message.trim()}
            >
              {loading ? "Parsing…" : "Parse tasks →"}
            </button>
          )}

          {/* AI Logs Stream */}
          {(logs.length > 0 || loading) && !preview && (
            <div className="task-logs" style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--text-muted)", background: "var(--bg-card)", padding: 8, borderRadius: 6, maxHeight: 150, overflowY: "auto", fontFamily: "monospace" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {loading && <CircleNotch size={14} className="spin-anim" style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* Preview of Gemini-parsed tasks */}
          {preview && (
            <div className="task-preview">
              <div className="task-preview-label">
                Found {preview.length} task{preview.length !== 1 ? "s" : ""} — review before adding:
              </div>
              <div className="task-preview-list">
                {preview.map((t, i) => (
                  <div key={i} className="task-preview-item">
                    <div className="task-preview-title">✦ {t.title}</div>
                    {t.description && (
                      <div className="task-preview-desc">{t.description}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="task-preview-actions">
                <button className="btn btn-primary" onClick={handleConfirm}>
                  Add {preview.length} task{preview.length !== 1 ? "s" : ""} to board ✓
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setPreview(null); setError(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Task board section ── */}
      <div className="tasks-board-wrap">
        <div className="tasks-board-head">
          <span className="bx-title">Task board</span>
          {openCount > 0 && (
            <span className="task-open-badge">{openCount} open</span>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="task-empty">
            No tasks yet. Ask the agent above to create some!
          </div>
        ) : (
          <div className="task-board">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                onAccept={acceptTask}
                onComplete={completeTask}
                onRemove={removeTask}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
