import React, { useState } from "react";
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
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Card } from "../components/common/Card";
import { useToast } from "../components/common/Toast";
import { EmptyState } from "../components/common/EmptyState";

export function QueueView({
  queue = [],
  onUpdateQueue,
  onOpenCreatePost,
}) {
  const { addToast } = useToast();
  const [queueItems, setQueueItems] = useState(queue);
  const [isQueuePaused, setIsQueuePaused] = useState(false);

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Publishing Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential dispatch pipeline. Auto-populates defined operational time slots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isQueuePaused ? "accent" : "secondary"}
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
        </div>
      </div>

      {/* Global Queue Alert Banner if paused */}
      {isQueuePaused && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Queue is currently paused.</strong> Posts will hold their slot positions but will not dispatch until resumed.
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsQueuePaused(false)}
            className="text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
          >
            Resume Now
          </Button>
        </div>
      )}

      {/* Next Scheduled Post Spotlight Card */}
      {nextPost && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Next In Line (Slot #1)</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <Clock className="w-3 h-3" />
              <span>Dispatching {nextPost.publishTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-700">
                <PlatformIcon platform={nextPost.platform} className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {nextPost.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
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
        </div>
      )}

      {/* Visual Queue Order Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Queue Order & Time Slots
          </span>
          <span className="text-xs font-mono text-slate-500">
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
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Order slot */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                        #{item.queueOrder}
                      </span>
                    </td>

                    {/* Post Title */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.title}
                    </td>

                    {/* Platform */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <PlatformIcon platform={item.platform} className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.platform}</span>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {item.account}
                    </td>

                    {/* Publish Slot & countdown */}
                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div className="font-medium text-slate-800">{item.publishTime}</div>
                      <div className="text-[10px] text-slate-400">in {item.timeRemaining}</div>
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
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === queueItems.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => togglePauseItem(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
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
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
    </div>
  );
}
