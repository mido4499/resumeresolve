export const FLIP_MS = 700;

export function isBackVisible(rotation: number) {
    return Math.abs(rotation / 180) % 2 === 1;
}

type FlipCardProps = {
    rotation: number;           // multiples of 180; each +/-180 flips the card once
    front: React.ReactNode;
    back: React.ReactNode;
};

// A card with two faces that turns over like a flash card. Both faces share one grid cell,
// so the card is as tall as its taller face. The hidden face is inert so it can't take focus.
export default function FlipCard({ rotation, front, back }: FlipCardProps) {
    const backVisible = isBackVisible(rotation);

    return (
        <div className="perspective-[2000px]">
            <div
                className="grid transform-3d transition-transform ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                style={{ transform: `rotateY(${rotation}deg)`, transitionDuration: `${FLIP_MS}ms` }}
            >
                <div className="col-start-1 row-start-1 backface-hidden" inert={backVisible} aria-hidden={backVisible}>
                    {front}
                </div>
                <div className="col-start-1 row-start-1 backface-hidden rotate-y-180" inert={!backVisible} aria-hidden={!backVisible}>
                    {back}
                </div>
            </div>
        </div>
    );
}
