export function PageTitle({ title }: { title: string }) {
  return (
    <div className="prose">
      <h1>{title}</h1>
    </div>
  );
}

export default PageTitle;
