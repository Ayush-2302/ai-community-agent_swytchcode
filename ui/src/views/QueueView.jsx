import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  Clock,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Button,
  StatusBadge,
  Card,
  Alert,
  EmptyState,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { useToast } from "../components/common/Toast";

export function QueueView({
  queue = [],
  onUpdateQueue,
  onOpenCreatePost,
}) {
  const { addToast } = useToast();
  const [queueItems, setQueueItems] = useState(queue);
  const [isQueuePaused, setIsQueuePaused] = useState(false);

  useEffect(() => {
    if (queue) {
      setQueueItems(queue);
    }
  }, [queue]);

  const nextPost = queueItems[0];

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...queueItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    // update queue order numbers
    newItems.forEach((item, i) => {
      item.queueOrder = i + 1;
    });
    setQueueItems(newItems);
    onUpdateQueue(newItems);
    addToast({
      type: "info",
      title: "Queue Reordered",
      message: `Moved "${newItems[index - 1].title}" to slot #${index}.`,
    });
  };

  const handleMoveDown = (index) => {
    if (index === queueItems.length - 1) return;
    const newItems = [...queueItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    newItems.forEach((item, i) => {
      item.queueOrder = i + 1;
    });
    setQueueItems(newItems);
    onUpdateQueue(newItems);
    addToast({
      type: "info",
      title: "Queue Reordered",
      message: `Moved "${newItems[index + 1].title}" to slot #${index + 2}.`,
    });
  };

  const handleRemove = (id) => {
    const updated = queueItems.filter((i) => i.id !== id);
    updated.forEach((item, idx) => {
      item.queueOrder = idx + 1;
    });
    setQueueItems(updated);
    onUpdateQueue(updated);
    addToast({
      type: "success",
      title: "Removed from Queue",
      message: "Post removed from active dispatch queue.",
    });
  };

  const togglePauseItem = (id) => {
    const updated = queueItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === "Paused" ? "Scheduled" : "Paused",
        };
      }
      return item;
    });
    setQueueItems(updated);
    onUpdateQueue(updated);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Publishing Queue"
        description="Sequential dispatch pipeline. Auto-populates defined operational time slots."
        actions={
          <>
            <Button
              variant={isQueuePaused ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setIsQueuePaused(!isQueuePaused);
                addToast({
                  type: isQueuePaused ? "success" : "warning",
                  title: isQueuePaused ? "Queue Resumed" : "Queue Paused",
                  message: isQueuePaused
                    ? "Automation runner will resume processing scheduled items."
                    : "All automated queue dispatches have been paused.",
                });
              }}
              icon={isQueuePaused ? Play : Pause}
            >
              {isQueuePaused ? "Resume Queue" : "Pause Queue"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreatePost}
              icon={Plus}
            >
              Add to Queue
            </Button>
          </>
        }
      />

      {/* Global Queue Alert Banner if paused */}
      {isQueuePaused && (
        <Alert
          variant="warning"
          title="Queue is currently paused"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span>Posts will hold their slot positions but will not dispatch until resumed.</span>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setIsQueuePaused(false)}
            >
              Resume Now
            </Button>
          </div>
        </Alert>
      )}

      {/* Next Scheduled Post Spotlight Card */}
      {nextPost && (
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-text-muted pb-2 mb-3 border-b border-border-light">
            <div className="flex items-center gap-2 font-medium text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Next In Line (Slot #1)</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-primary font-semibold bg-primary-soft px-2 py-0.5 rounded border border-primary-soft">
              <Clock className="w-3 h-3" />
              <span>Dispatching {nextPost.publishTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md border border-border bg-surface-soft flex items-center justify-center shrink-0 text-text-primary">
                <PlatformIcon platform={nextPost.platform} className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {nextPost.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-1 font-mono">
                  <span>{nextPost.account}</span>
                  <span>•</span>
                  <span>Target: {nextPost.platform}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <StatusBadge status={nextPost.status} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => togglePauseItem(nextPost.id)}
              >
                {nextPost.status === "Paused" ? "Resume" : "Hold"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Visual Queue Order Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-border bg-surface-soft/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Queue Order & Time Slots
          </span>
          <span className="text-xs font-mono text-text-muted">
            {queueItems.length} items in sequence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="w-16 px-4 py-3 text-center">Slot</th>
                <th className="px-4 py-3 min-w-[240px]">Post Title</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Publish Slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Queue Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      title="Your publishing queue is currently empty"
                      description="No posts are currently sequenced in this queue."
                      actionLabel="Create Post"
                      onAction={onOpenCreatePost}
                    />
                  </td>
                </tr>
              ) : (
                queueItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-hover/80 transition-colors"
                  >
                    {/* Order slot */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-surface-soft text-text-primary font-mono font-bold text-xs border border-border">
                        #{item.queueOrder}
                      </span>
                    </td>

                    {/* Post Title */}
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {typeof item.title === "object"
                        ? item.title?.caption || item.title?.title || JSON.stringify(item.title)
                        : item.title}
                    </td>

                    {/* Platform */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <PlatformIcon platform={item.platform} className="w-3.5 h-3.5 text-text-muted" />
                        <span>{item.platform}</span>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">
                      {item.account}
                    </td>

                    {/* Publish Slot & countdown */}
                    <td className="px-4 py-3 font-mono text-text-secondary">
                      <div className="font-medium text-text-primary">{item.publishTime}</div>
                      <div className="text-[10px] text-text-muted">in {item.timeRemaining}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === queueItems.length - 1}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => togglePauseItem(item.id)}
                          className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
                          title={item.status === "Paused" ? "Resume" : "Pause"}
                        >
                          {item.status === "Paused" ? (
                            <Play className="w-3.5 h-3.5" />
                          ) : (
                            <Pause className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-soft cursor-pointer"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
