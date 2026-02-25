import { Button, Modal } from "react-bootstrap";

interface ScoreConfirmModalProps {
    show: boolean;
    onConfirm: (hasScore: boolean) => void;
}

const ScoreConfirmModal: React.FC<ScoreConfirmModalProps> = ({ show, onConfirm }) => (
    <Modal show={show} onHide={() => onConfirm(true)}>
        <Modal.Header closeButton>
            <Modal.Title>Report score</Modal.Title>
        </Modal.Header>
        <Modal.Body>Did you report any score in this round?</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => onConfirm(true)}>Yes</Button>
            <Button variant="primary" onClick={() => onConfirm(false)}>No</Button>
        </Modal.Footer>
    </Modal>
);

export default ScoreConfirmModal;