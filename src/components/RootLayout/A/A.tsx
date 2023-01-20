interface AProps {
  children: React.ReactNode;
  href?: string;
  to?: string;
  className?: string;
  "aria-current"?: "page";
}
const A: React.FC<AProps> = (props) => {
  return <a {...props}></a>;
};

export default A;
