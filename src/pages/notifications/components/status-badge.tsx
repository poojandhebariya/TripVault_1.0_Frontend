import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "accepted")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
        <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
        Accepted
      </span>
    );
  if (status === "declined")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
        <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
        Declined
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
      ● Pending
    </span>
  );
};

export default StatusBadge;
