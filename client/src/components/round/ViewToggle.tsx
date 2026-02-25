interface ViewToggleProps {
    showPerformances: boolean;
    onToggle: (e: React.MouseEvent) => void;
  }
  
  const ViewToggle: React.FC<ViewToggleProps> = ({ showPerformances, onToggle }) => (
    <div className="btn-group">
      <button
        onClick={onToggle}
        className={`btn ${showPerformances ? "btn-primary" : "btn-light"}`}
      >
        Participants
      </button>
      <button
        onClick={onToggle}
        className={`btn ${showPerformances ? "btn-light" : "btn-primary"}`}
      >
        Game
      </button>
    </div>
  );
  
  
  
export default ViewToggle;  