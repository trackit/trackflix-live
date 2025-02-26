export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-8 bg-base-100 rounded-xl shadow-lg transition-all duration-300 ${
        className || ''
      }`}
    >
      {children}
    </div>
  );
}

export default Panel;
