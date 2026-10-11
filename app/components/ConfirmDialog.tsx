import Button from "./Button";
import Modal from "./Modal"

type ConfirmDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string,
    description?: string
}

export default function ConfirmDialog({isOpen, onClose, onConfirm, title, description}: ConfirmDialogProps) {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-(--platinum)">{title}</h2>
                    {description && <p className="text-(--steel)">{description}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" className="bg-transparent ring-1 ring-(--slate) hover:bg-(--charcoal)" onClick={()=>onClose()}>
                        Cancel
                    </Button>
                    <Button variant="secondary" className="bg-(--rust) hover:bg-(--rust)/85" onClick={()=>{onConfirm(); onClose();}}>
                        Remove
                    </Button>
                </div>
            </div>
        </Modal>
    )

}
