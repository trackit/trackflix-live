export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`container p-8 bg-base-100 rounded-xl shadow ${
        className || ''
      }`}
    >
      {children}
    </div>
  );
}

export default Panel;
