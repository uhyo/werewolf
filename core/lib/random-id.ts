// Fast (pseudo-)random id.
// Use this for the uniqueness in a single game.
export default function randomID(): string{
    return (0|Math.random()*0x40000000).toString(36);
}
