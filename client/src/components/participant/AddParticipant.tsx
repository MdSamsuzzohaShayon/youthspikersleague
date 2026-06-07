import React, {
    ChangeEvent,
    SyntheticEvent,
    useMemo,
    useRef,
    useState,
} from "react";
import { Button, Modal } from "react-bootstrap";
import { hostname } from "../../utils/global";

interface ValidationError {
    msg: string;
}

interface ParticipantForm {
    firstname: string;
    lastname: string;
    email: string;
    cell: string;
    birthdate: string;
    payment_amount: string;
    payment_method: string;
    city: string;
}

interface Participant {
    [key: string]: unknown;
}

interface IAddParticipantProps {
    eventID: string;
    eventName: string;
    handleSaveParticipant: (participant: Participant) => void;
}

const INITIAL_FORM: ParticipantForm = {
    firstname: "",
    lastname: "",
    email: "",
    cell: "",
    birthdate: "",
    payment_amount: "",
    payment_method: "Cash",
    city: "",
};

function AddParticipant({
    eventID,
    eventName,
    handleSaveParticipant,
}: IAddParticipantProps) {


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participantForm, setParticipantForm] =
        useState<ParticipantForm>(INITIAL_FORM);
    const [validationErrors, setValidationErrors] = useState<
        ValidationError[]
    >([]);

    const uniqueErrors = useMemo(() => {
        return Array.from(
            new Map(
                validationErrors.map((error) => [error.msg, error])
            ).values()
        );
    }, [validationErrors]);

    const openModal = () => {
        setValidationErrors([]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setValidationErrors([]);
        setParticipantForm(INITIAL_FORM);
        setIsModalOpen(false);
    };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        setParticipantForm((previousState) => ({
            ...previousState,
            [name]: value,
        }));
    };

    const saveParticipant = async (
        e: SyntheticEvent
    ) => {
        e
        setValidationErrors([]);

        try {
            const token = localStorage.getItem("token");
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(participantForm)
            }
            const response = await fetch(
                `${hostname}/api/performance/${eventID}`,
                options
            );

            const data = await response.json();

            if (!response.ok || data.errors) {
                setValidationErrors(data.errors ?? [
                    { msg: "Unable to save participant." },
                ]);
                return;
            }

            handleSaveParticipant(data);

            closeModal();
        } catch (error) {

            setValidationErrors([
                {
                    msg: "Something went wrong. Please try again.",
                },
            ]);

            console.error(error);
        }
    };

    return (
        <>
            <h3 className="h3">Add participants for this events</h3>

            {uniqueErrors.map((error) => (
                <p key={error.msg} className="text-warning">
                    {error.msg}
                </p>
            ))}

            <Button variant="primary" onClick={openModal}>
                Add participants
            </Button>

            <Modal show={isModalOpen} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{eventName}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {uniqueErrors.map((error) => (
                        <p key={error.msg} className="text-danger">
                            {error.msg}
                        </p>
                    ))}

                    <form>
                        <FormInput
                            id="firstname"
                            label="First Name*"
                            placeholder="Enter Your First Name"
                            required
                            value={participantForm.firstname}
                            onChange={handleInputChange}
                        />

                        <FormInput
                            id="lastname"
                            label="Last Name*"
                            required
                            placeholder="Enter Your Last Name"
                            value={participantForm.lastname}
                            onChange={handleInputChange}
                        />

                        <FormInput
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="Enter Your Email"
                            value={participantForm.email}
                            onChange={handleInputChange}
                        />

                        <FormInput
                            id="cell"
                            label="Phone"
                            placeholder="Enter Your Phone Number"
                            value={participantForm.cell}
                            onChange={handleInputChange}
                        />

                        <FormInput
                            id="birthdate"
                            type="date"
                            label="Birthdate"
                            value={participantForm.birthdate}
                            onChange={handleInputChange}
                        />

                        <FormInput
                            id="payment_amount"
                            label="Payment Amount"
                            placeholder="Enter Payment Amount"
                            value={participantForm.payment_amount}
                            onChange={handleInputChange}
                        />

                        <div className="form-group">
                            <label htmlFor="payment_method">
                                Payment Method
                            </label>

                            <select
                                id="payment_method"
                                name="payment_method"
                                className="form-control"
                                value={participantForm.payment_method}
                                onChange={handleInputChange}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Check">Check</option>
                                <option value="Venmo">Venmo</option>
                            </select>
                        </div>

                        <FormInput
                            id="city"
                            label="City"
                            placeholder="Enter Your City"
                            value={participantForm.city}
                            onChange={handleInputChange}
                        />
                    </form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>

                    <Button variant="primary" onClick={saveParticipant}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

interface FormInputProps {
    id: keyof ParticipantForm;
    label: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    type?: string;
    onChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
}

function FormInput({
    id,
    label,
    value,
    placeholder,
    required,
    type = "text",
    onChange,
}: FormInputProps) {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>

            <input
                id={id}
                name={id}
                type={type}
                required={required || false}
                className="form-control"
                value={value}
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
}

export default React.memo(AddParticipant);