// client/src/components/Logo.tsx

interface LogoProps extends React.SVGAttributes<HTMLDivElement> {
  type?: "full" | "icon";
}

export function Logo({ type = "full", className, ...props }: LogoProps) {
  const SvgIcon = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Teal Arrow */}
        <path d="M 85,50 A 35,35 0 1 1 50,15" stroke="hsl(var(--secondary))" />
        <path
          d="M 50,15 L 65,30 M 50,15 L 35,30"
          stroke="hsl(var(--secondary))"
        />
        {/* Green Checkmark */}
        <path d="M 30,55 L 45,70 L 70,45" stroke="hsl(var(--primary))" />
      </g>
    </svg>
  );

  if (type === "icon") {
    return (
      <div className={className} style={{ width: 42, height: 42 }} {...props}>
        <SvgIcon />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      {...props}
      style={{ userSelect: "none" }}
    >
      <div style={{ width: 32, height: 32 }}>
        <SvgIcon />
      </div>
      <span className="text-2xl font-bold tracking-wider">
        <span className="text-secondary">e</span>
        <span className="text-foreground/80">Vend</span>
      </span>
    </div>
  );
}
