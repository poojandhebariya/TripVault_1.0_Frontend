import { useState, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faDownload,
  faFireFlameCurved,
  faEarthAmericas,
  faChevronDown,
  faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { bucketListQueries } from "../../tanstack/bucket-list/queries";
import { useUserContext } from "../../contexts/user/user";
import { useSnackbar } from "react-snackify";
import BucketListCard from "../../components/bucket-list-card";
import Pagination from "../../components/pagination-bar";
import Button from "../../components/ui/button";
import type { BucketListDto } from "../../types/bucket-list";
import { generateBucketListPdf } from "../../utils/Generatebucketlistpdf";

export default function BucketList() {
  const { isLoggedIn, user } = useUserContext();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const shareListRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  const { getBucketList, getStats } = bucketListQueries();

  const { data: statsData } = useQuery({
    ...getStats(),
    enabled: isLoggedIn,
  });

  const { data: listData, isLoading } = useQuery({
    ...getBucketList(page, sortBy, sortDir),
    enabled: isLoggedIn,
  });

  const filteredData = listData?.data.filter((item: BucketListDto) => {
    if (priorityFilter === "ALL") return true;
    return item.priority === priorityFilter;
  });

  const handleDownloadPdf = async () => {
    if (!listData?.data || listData.data.length === 0) return;

    setIsGeneratingPdf(true);
    const snackbar = showSnackbar({
      message: "Generating your PDF...",
      variant: "loading",
    });

    try {
      const dataUrl = await generateBucketListPdf(
        listData.data,
        {
          totalPlaces: statsData?.totalPlaces ?? 0,
          highPriority: statsData?.highPriority ?? 0,
          countries: statsData?.countries ?? 0,
        },
        user?.name || user?.username,
      );

      const fileName = `TripVault_BucketList_${Date.now()}.pdf`;

      // Capacitor Native Share/Save for Android/iOS
      if (Capacitor.isNativePlatform()) {
        try {
          // Extract base64 without prefix
          const base64Data = dataUrl.split(",")[1];

          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          await Share.share({
            title: `${user?.name || user?.username || "My"} TripVault Bucket List`,
            text: `Check out ${user?.name || user?.username || "my"} travel bucket list on TripVault!`,
            url: savedFile.uri,
            dialogTitle: "Save your list",
          });

          snackbar.update({
            message: "PDF saved successfully!",
            variant: "success",
          });
        } catch (shareErr: any) {
          console.error("Native PDF save failed", shareErr);
          // If user cancels, we just close snackbar and exit
          if (
            !shareErr.message ||
            shareErr.message.includes("cancelled") ||
            shareErr.message.includes("AbortError")
          ) {
            snackbar.close();
          } else {
            snackbar.update({
              message: "Failed to save PDF natively.",
              variant: "error",
            });
          }
        }
      } else {
        // Traditional Web Download using Blob for better compatibility
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);

        snackbar.update({
          message: "PDF downloaded successfully! 🎉",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("PDF generation failed", err);
      snackbar.update({
        message: "Failed to generate PDF. Please try again.",
        variant: "error",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5 mt-1 md:mt-0">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text w-fit pb-1">
              My Bucket List
            </h1>
            <p className="text-base font-medium text-gray-500 mt-0.5">
              Dream big, plan well, travel far.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || !listData?.data?.length}
              className="md:hidden! shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition-all duration-200 active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Save as PDF"
            >
              <FontAwesomeIcon
                icon={faDownload}
                className={isGeneratingPdf ? "animate-pulse" : ""}
              />
            </button>
            {/* Desktop: full button */}
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || !listData?.data?.length}
              icon={faDownload}
              text={isGeneratingPdf ? "Saving..." : "Save"}
              loading={isGeneratingPdf}
              className="hidden md:inline-flex w-auto whitespace-nowrap text-sm py-2 px-4 rounded-lg"
            />
          </div>
        </div>

        {/* ── Stats Card (matches profile.tsx style) ── */}
        {statsData && (
          <div className="rounded-2xl border border-gray-200 bg-gray-100/40 py-5 mb-5">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="flex flex-col items-center gap-1.5 px-4 py-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-100">
                  <FontAwesomeIcon
                    icon={faMapLocationDot}
                    className="text-sky-500 text-base"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 leading-none">
                  {statsData.totalPlaces}
                </span>
                <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                  Total
                  <br />
                  Places
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 px-4 py-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100">
                  <FontAwesomeIcon
                    icon={faFireFlameCurved}
                    className="text-orange-500 text-base"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 leading-none">
                  {statsData.highPriority}
                </span>
                <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                  High
                  <br />
                  Priority
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 px-4 py-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-violet-100">
                  <FontAwesomeIcon
                    icon={faEarthAmericas}
                    className="text-violet-500 text-base"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 leading-none">
                  {statsData.countries}
                </span>
                <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                  Countries
                  <br />
                  Listed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters & Sort ── */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((prio) => (
              <button
                key={prio}
                onClick={() => setPriorityFilter(prio)}
                className={`flex items-center rounded-full border px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  priorityFilter === prio
                    ? "bg-linear-to-r from-blue-600 to-purple-700 text-white border-transparent shadow-md shadow-blue-100"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {prio === "ALL"
                  ? "All"
                  : prio.charAt(0) + prio.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Sort — icon-only on mobile, label on md+ */}
          <div className="relative group shrink-0">
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split("-");
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
            >
              <option value="createdAt-desc">Date Added (Newest)</option>
              <option value="createdAt-asc">Date Added (Oldest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="targetYear-asc">Target Year (Earliest)</option>
              <option value="targetYear-desc">Target Year (Latest)</option>
            </select>
            {/* Mobile: icon-only circle */}
            <div className="md:hidden! w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-500 group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-200">
              <FontAwesomeIcon
                icon={faArrowDownWideShort}
                className="text-sm"
              />
            </div>
            {/* Desktop: label + chevron */}
            <div className="hidden md:flex px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl items-center gap-2.5 group-hover:bg-gray-100 group-hover:border-gray-200 transition-all duration-300">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {sortBy === "createdAt"
                  ? sortDir === "desc"
                    ? "Newest First"
                    : "Oldest First"
                  : sortBy === "priority"
                    ? sortDir === "desc"
                      ? "Priority ↓"
                      : "Priority ↑"
                    : sortDir === "asc"
                      ? "Year (Earliest)"
                      : "Year (Latest)"}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 mt-10">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl text-blue-400 mb-4 shadow-sm">
              <FontAwesomeIcon icon={faMapLocationDot} />
            </div>
            <p className="text-[17px] font-bold text-gray-900">No places yet</p>
            <p className="text-[14px] text-gray-500 mt-1.5 max-w-[260px] leading-relaxed">
              Explore vaults and add your dream destinations to your personal
              bucket list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
            {filteredData?.map((item: BucketListDto) => (
              <BucketListCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {!isLoading && (listData?.totalPages ?? 0) > 1 && (
          <Pagination
            page={page}
            totalPages={listData?.totalPages ?? 1}
            onPrev={() => setPage(Math.max(1, page - 1))}
            onNext={() =>
              setPage(Math.min(listData?.totalPages ?? 1, page + 1))
            }
          />
        )}

        {/* ── Hidden Shareable Node for Whole List ── */}
        <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none z-[-9999]">
          <div
            ref={shareListRef}
            className="w-[600px] bg-white overflow-hidden flex flex-col rounded-[2.5rem]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div className="bg-linear-to-r from-blue-700 to-purple-700 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[10px_10px]" />
              <h1 className="text-white text-5xl font-black mb-2 relative z-10 drop-shadow-md tracking-tight">
                {user?.name || user?.username || "My"} Bucket List
              </h1>
              <p className="text-blue-100 text-lg font-bold uppercase tracking-widest relative z-10">
                TripVault Collection
              </p>
            </div>

            <div className="bg-gray-50 flex justify-center gap-8 py-5 border-b border-gray-100">
              <div className="text-center w-24">
                <div className="text-3xl font-black text-gray-900">
                  {statsData?.totalPlaces || 0}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Places
                </div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center w-28">
                <div className="text-3xl font-black text-orange-500">
                  {statsData?.highPriority || 0}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  High Prio
                </div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="text-center w-24">
                <div className="text-3xl font-black text-purple-600">
                  {statsData?.countries || 0}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Countries
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-4 bg-white">
              {listData?.data?.slice(0, 5).map((item, idx) => {
                const vault = item.vault;
                const img = vault.attachments?.find(
                  (a: any) => a.type === "image",
                )?.url;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center bg-gray-50 rounded-2xl p-3 border border-gray-100"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                      {img ? (
                        <img
                          src={img}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-extrabold text-gray-900 text-lg line-clamp-1">
                        {vault.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold mt-1">
                        <span className="text-gray-500">
                          <FontAwesomeIcon
                            icon={faMapLocationDot}
                            className="mr-1"
                          />
                          {vault.location?.label
                            ? vault.location.label.split(",").pop()?.trim()
                            : "Unknown"}
                        </span>
                        <span className="text-purple-600">
                          Target: {item.targetYear}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}

              {(listData?.data?.length || 0) > 5 && (
                <div className="text-center text-gray-400 font-bold text-sm mt-2">
                  ...and {(listData?.data?.length || 0) - 5} more amazing
                  places!
                </div>
              )}
            </div>

            <div className="bg-gray-900 justify-center items-center py-4 flex gap-2">
              <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-black">
                T
              </div>
              <span className="text-white font-bold tracking-widest uppercase text-xs">
                TripVault App
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
