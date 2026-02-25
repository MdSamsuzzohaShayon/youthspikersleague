interface IStatusMessageProps {
  visible: boolean;
  isNegative: boolean;
}

const StatusMessage: React.FC<IStatusMessageProps> = ({ visible, isNegative }) => {
  if (!visible) return null;
  return (
    <div className={`alert alert-${isNegative ? "danger" : "success"}`}>
      You can't reassign once the score is inputted
    </div>
  );
};

export default StatusMessage;
