import "./admin-product-state.css";

interface AdminProductStateProps {
  title: string;
  body: string;
  onRetry?: () => void;
}

export function AdminProductState({ title, body, onRetry }: AdminProductStateProps) {
  return (
    <div className="admin-product-state" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {onRetry ? (
        <button className="secondary-button" type="button" onClick={onRetry}>
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}
