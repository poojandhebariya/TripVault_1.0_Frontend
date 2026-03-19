import CommentPanel from "../../../components/comment-panel";

interface CommentsTabProps {
  vaultId: string;
}

const CommentsTab = ({ vaultId }: CommentsTabProps) => {
  return (
    <div className="animate-[fadeInUp_0.2s_ease-out]">
      <CommentPanel vaultId={vaultId} hideCountHeader={true} showInput={true} />
    </div>
  );
};

export default CommentsTab;
