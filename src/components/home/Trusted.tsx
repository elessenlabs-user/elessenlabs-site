import Image from "next/image";
import styles from "./Trusted.module.css";
import { useTheme } from "../theme/ThemeProvider";

const logos: {
  name: string;
  src: string;
  darkSrc?: string;
  className: string;
}[] = [
{
  name: "PwC",
  src: "/client logos/pwc.png",
  darkSrc: "/client logos/pwc-dark.png",
  className: "pwc",
},
  {
    name: "BDO",
    src: "/client logos/bdo.png",
    darkSrc: "/client logos/bdo-dark.png",
    className: "bdo",
  },
  {
    name: "Oliver Wyman",
    src: "/client logos/oliver-wyman.png",
    darkSrc: "/client logos/oliver-wyman-dark.png",
    className: "oliverWyman",
  },
  {
    name: "STC",
    src: "/client logos/stc.png",
    darkSrc: "/client logos/stc-dark.png",
    className: "stc",
  },
  {
  name: "Petro-Canada",
  src: "/client logos/petro-canada.png",
  darkSrc: "/client logos/petro-canada-dark.png",
  className: "petroCanada",
},
  {
    name: "ENMAX",
    src: "/client logos/enmax.png",
    darkSrc: "/client logos/enmax-dark.png",
    className: "enmax",
  },
  
];

export default function Trusted() {

    const { resolvedTheme } = useTheme();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>EXPERIENCE</p>

        <h2 className={styles.heading}>
          Trusted by organisations delivering essential services.
        </h2>

        <p className={styles.subheading}>
          Consulting <span>•</span> Government <span>•</span>{" "}
          Telecommunications <span>•</span> Energy <span>•</span> SaaS
        </p>

        <div className={styles.logoGrid}>
          {logos.map((logo) => (
            <div
              key={logo.name}
              className={`${styles.logo} ${styles[logo.className]}`}
            >
              <Image
                src={
                resolvedTheme === "dark" && logo.darkSrc
                ? logo.darkSrc
                : logo.src
                }
                
                alt={logo.name}
                width={220}
                height={90}
                className={styles.logoImage}
            />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}