export default function LoadingState({ text = "Loading..." }: { text?: string }) {
  return <p className="muted">{text}</p>;
}
