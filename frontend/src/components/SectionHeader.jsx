const SectionHeader = ({ eyebrow, title, description, align = "left" }) => (
  <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    {eyebrow ? <p className="mb-3 text-sm font-semibold text-sage">{eyebrow}</p> : null}
    <h2 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
    {description ? <p className="mt-4 text-base leading-7 text-ink/70">{description}</p> : null}
  </div>
);

export default SectionHeader;
