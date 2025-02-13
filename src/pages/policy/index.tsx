import { useTranslation } from "react-i18next";

export default function Policy() {
  const { t } = useTranslation();
  const lastUpdate = "25/11/2024";
  return (
    <section>
      <div className="py-10 bg-zinc-200 mx-4 mt-16 rounded-3xl lg:ml-40 lg:mr-40">
        <h1 className="text-center font-semibold text-2xl">{t("policy.title")}</h1>
        <p className="mx-4 mt-8 lg:mx-10">{t("policy.last_update")} {lastUpdate}</p>
        <p className="mx-4 mt-3 text-justify lg:mx-10">
          {t("policy.welcome")}{" "}
          <a
            className="font-semibold underline"
            href="https://save-ten.vercel.app."
          >
            https://save-ten.vercel.app.
          </a>
        </p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.1")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">
          {t("policy.collect")}
          <br />
          <br />
          {t("policy.name")}
          <br />
          {t("policy.email")}
          <br />
          {t("policy.cpf")}
          <br />
          <br />
          {t("policy.data")}
        </p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.2")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.database")}</p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.3")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">
          {t("policy.cookies")}
          <br />
          <br />
          {t("policy.cookies1")}
        </p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.4")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">
          {t("policy.personal_data")}
          <br />
          <br />
          {t("policy.validation")}
          <br />
          {t("policy.send")}
        </p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.5")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.share")}</p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.6")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.security")}</p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.7")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.stored_data")}</p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.8")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">
          {t("policy.lgpd")}
          <br />
          <br />
          {t("policy.access")}
          <br />
          {t("policy.correct")}
          <br />
          {t("policy.delete")}
          <br />
          {t("policy.revogate")}
          <br />
          <br />
          {t("policy.rights")}
        </p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.9")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.update")}</p>
        <h3 className="mx-4 mt-8 lg:mx-10 font-semibold">{t("policy.10")}</h3>
        <p className="mx-4 mt-3 text-justify lg:mx-10">{t("policy.contact")}</p>
      </div>
    </section>
  );
}
