import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { userQueries } from "../../tanstack/user/queries";
import { userMutation } from "../../tanstack/user/mutation";
import MobileStickyHeader from "../../components/mobile-sticky-header";
import NotificationCard from "../../components/notifications/notification-card";

const NotificationsPage = () => {
  const { getNotifications } = userQueries();
  const { markNotificationsAsReadMutation } = userMutation();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery(getNotifications());

  const readMut = useMutation(markNotificationsAsReadMutation());
  const markedUnreadIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unreadIds = notifications
      .filter((n) => n.isRead === false)
      .map((n) => n.id);

    const newUnreadIds = unreadIds.filter(
      (id) => !markedUnreadIdsRef.current.has(id)
    );

    if (newUnreadIds.length > 0 && !readMut.isPending) {
      newUnreadIds.forEach((id) => markedUnreadIdsRef.current.add(id));
      readMut.mutate(undefined as any);
    }
  }, [notifications, readMut.isPending, readMut.mutate]);

  const pendingNotifications = notifications.filter(
    (n) => n.type === "TAG" && n.status === "pending",
  );
  const pendingCount = pendingNotifications.length;
  const earlierNotifications = notifications.filter(
    (n) => !(n.type === "TAG" && n.status === "pending"),
  );

  return (
    <div className="animate-[slideDown_0.3s_ease-out] min-h-screen bg-white pb-24">
      <MobileStickyHeader title="Notifications" />

      {/* ── Content with Ad Layout ── */}
      <div className="max-w-7xl mx-auto md:py-8 md:px-6 xl:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Main Feed Column */}
          <div className="flex-1 min-w-0 md:py-0 py-4">
            <div className="hidden lg:block mb-6 mt-2">
              <p className="text-3xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-3 px-4 md:px-0">
                Notifications
              </p>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-indigo-500 text-xl animate-spin"
                  />
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Loading notifications…
                </p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 text-xl">
                  <FontAwesomeIcon icon={faBell} />
                </div>
                <p className="font-bold text-gray-800">
                  Couldn't load notifications
                </p>
                <p className="text-sm text-gray-400">
                  Please check your connection and try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-5 py-2 rounded-full text-sm font-bold text-white cursor-pointer active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner"
                  style={{
                    background:
                      "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    className="text-indigo-300 text-2xl"
                  />
                </div>
                <div>
                  <p className="text-[17px] font-bold text-gray-900">
                    No notifications yet
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Likes, comments, follows, tags, and saves will all appear here.
                  </p>
                </div>
              </div>
            )}

            {/* Pending section */}
            {!isLoading && !isError && pendingCount > 0 && (
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1 px-4 md:px-0">
                  ● Pending ({pendingCount})
                </p>
                <div className="flex flex-col border-t border-gray-100 mt-2">
                  {pendingNotifications.map((n) => (
                    <NotificationCard key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            )}

            {/* Earlier section */}
            {!isLoading && !isError && earlierNotifications.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1 px-4 md:px-0 mt-2">
                  Earlier
                </p>
                <div className="flex flex-col border-t border-gray-100 mt-2">
                  {earlierNotifications.map((n) => (
                    <NotificationCard key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ad Space Column */}
          <div className="w-full lg:w-[380px] shrink-0 px-4 md:px-0 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="w-full h-[600px] border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-gray-50 text-gray-400 font-bold tracking-widest uppercase text-xs">
                Advertisement Space
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
