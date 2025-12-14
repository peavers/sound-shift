import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { AudioDevice, DeviceGroup } from "../types";
import GroupCard from "../components/groups/GroupCard";
import GroupModal from "../components/groups/GroupModal";
import { isDemoMode, mockDevices, mockGroups } from "../mocks/demoData";

export default function GroupsPage() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Use mock data in demo mode
      if (isDemoMode()) {
        setGroups(mockGroups);
        setDevices(mockDevices);
        setError(null);
        setLoading(false);
        return;
      }

      const [groupsResult, devicesResult] = await Promise.all([
        invoke<DeviceGroup[]>("get_groups"),
        invoke<AudioDevice[]>("get_audio_devices"),
      ]);
      setGroups(groupsResult);
      setDevices(devicesResult);
      setError(null);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroup = async (group: Omit<DeviceGroup, "id" | "current_index"> & { id?: string }) => {
    try {
      if (group.id) {
        await invoke("update_group", { group: { ...group, current_index: editingGroup?.current_index ?? 0 } });
      } else {
        await invoke("create_group", { name: group.name, deviceIds: group.device_ids, shortcut: group.shortcut });
      }
      await fetchData();
      setModalOpen(false);
      setEditingGroup(null);
    } catch (e) {
      setError(e as string);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await invoke("delete_group", { groupId });
      await fetchData();
    } catch (e) {
      setError(e as string);
    }
  };

  const handleEditGroup = (group: DeviceGroup) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const handleCycleGroup = async (groupId: string) => {
    try {
      await invoke("cycle_group", { groupId });
      await fetchData();
    } catch (e) {
      setError(e as string);
    }
  };

  const handleSelectDevice = async (groupId: string, deviceIndex: number) => {
    try {
      await invoke("select_group_device", { groupId, deviceIndex });
      await fetchData();
    } catch (e) {
      setError(e as string);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for device switches from keyboard shortcuts
    const unlisten = listen("device-switched", () => {
      fetchData();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-surface-100 tracking-tight">Device Groups</h2>
          <p className="text-surface-400 mt-1">Create groups and assign keyboard shortcuts</p>
        </div>
        <button
          onClick={() => {
            setEditingGroup(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all duration-200 text-sm font-medium text-white flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 animate-pulse-subtle"></div>
        </div>
      ) : error ? (
        <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-4 text-danger-400">
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-100 mb-2">No groups yet</h3>
          <p className="text-surface-400 mb-6 max-w-sm mx-auto">
            Create a group to start switching between audio devices quickly
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all duration-200 text-sm font-medium text-white"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              devices={devices}
              onEdit={() => handleEditGroup(group)}
              onDelete={() => handleDeleteGroup(group.id)}
              onCycle={() => handleCycleGroup(group.id)}
              onSelectDevice={(index) => handleSelectDevice(group.id, index)}
            />
          ))}
        </div>
      )}

      <GroupModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGroup(null);
        }}
        onSave={handleSaveGroup}
        devices={devices}
        editingGroup={editingGroup}
      />
    </div>
  );
}
