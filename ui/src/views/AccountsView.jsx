import React, { useState } from "react";
import {
  Users2,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  RotateCw,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { useToast } from "../components/common/Toast";
import { swytchcode } from "../services/swytchcode";

export function AccountsView({ accounts = [], onUpdateAccount }) {
  const { addToast } = useToast();
  const [accountList, setAccountList] = useState(accounts);
  const [syncingId, setSyncingId] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // New account form state
  const [newPlatform, setNewPlatform] = useState("X");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newHandle, setNewHandle] = useState("");

  const handleSyncAccount = async (account) => {
    setSyncingId(account.id);
    addToast({
      type: "info",
      title: "Syncing Credentials",
      message: `Checking token validity & rate limits for ${account.platform}...`,
    });

    try {
      const res = await swytchcode.testConnection(account.platform.toLowerCase());
      setAccountList((prev) =>
        prev.map((acc) =>
          acc.id === account.id
            ? {
                ...acc,
                status: "Connected",
                lastSync: "Just now",
                rateLimitRemaining: "300 / 300 requests",
              }
            : acc
        )
      );

      addToast({
        type: "success",
        title: "Account Synced",
        message: `${account.displayName} refreshed successfully (${res.latency}ms).`,
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Sync Failed",
        message: err.message,
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleConnectAccount = () => {
    if (!newHandle.trim()) {
      addToast({
        type: "error",
        title: "Handle required",
        message: "Please enter the username or handle for this account.",
      });
      return;
    }

    const newAcc = {
      id: `acc_${Date.now()}`,
      platform: newPlatform,
      displayName: newDisplayName.trim() || newHandle.trim(),
      handle: newHandle.trim(),
      status: "Connected",
      lastSync: "Just now",
      rateLimitRemaining: "Standard Tier",
      tokenExpiry: "Active (OAuth 2.0 PKCE)",
      managedVia: "Swytchcode Connector",
    };

    setAccountList((prev) => [newAcc, ...prev]);
    setIsConnectModalOpen(false);
    setNewDisplayName("");
    setNewHandle("");

    addToast({
      type: "success",
      title: "Account Connected",
      message: `Linked ${newAcc.displayName} (${newAcc.platform}) via Swytchcode.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Connected Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated platform tokens, permissions, rate limits, and webhook listeners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              accountList.forEach((acc) => handleSyncAccount(acc));
            }}
            icon={RefreshCw}
          >
            Sync All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            icon={Plus}
          >
            Connect Account
          </Button>
        </div>
      </div>

      {/* Account Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Account & Handle</th>
              <th className="px-4 py-3">Connection Status</th>
              <th className="px-4 py-3">Rate Limits</th>
              <th className="px-4 py-3">Last Synced</th>
              <th className="px-4 py-3">Auth Gateway</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accountList.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Platform */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      <PlatformIcon platform={acc.platform} className="w-4 h-4 text-slate-700" />
                    </div>
                    <span className="font-semibold text-slate-900">{acc.platform}</span>
                  </div>
                </td>

                {/* Account & Handle */}
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-900">{acc.displayName}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{acc.handle}</div>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={acc.status} />
                  <div className="text-[10px] text-slate-400 mt-0.5">{acc.tokenExpiry}</div>
                </td>

                {/* Rate Limits */}
                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                  {acc.rateLimitRemaining}
                </td>

                {/* Last Synced */}
                <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                  {acc.lastSync}
                </td>

                {/* Gateway */}
                <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {acc.managedVia}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSyncAccount(acc)}
                      disabled={syncingId === acc.id}
                      icon={RefreshCw}
                    >
                      {syncingId === acc.id ? "Syncing..." : "Sync"}
                    </Button>
                    {acc.status === "Error" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSyncAccount(acc)}
                      >
                        Reconnect
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Connect Account Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect Social Account"
        description="Authenticate a new social profile or community channel through Swytchcode."
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConnectAccount}>
              Authorize & Connect
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Platform"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            options={[
              { value: "X", label: "X (Twitter)" },
              { value: "LinkedIn", label: "LinkedIn Company / Profile" },
              { value: "Instagram", label: "Instagram Professional" },
              { value: "Facebook", label: "Facebook Page" },
              { value: "Telegram", label: "Telegram Channel / Bot" },
              { value: "Slack", label: "Slack Workspace Webhook" },
            ]}
          />

          <Input
            label="Display Name"
            placeholder="e.g. Acme Marketing"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />

          <Input
            label="Username / Handle / ID"
            placeholder="e.g. @acme_marketing or #announcements"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            required
          />

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
            Authorization tokens are vaulted using AES-256 encryption and refreshed automatically before expiration.
          </div>
        </div>
      </Modal>
    </div>
  );
}
