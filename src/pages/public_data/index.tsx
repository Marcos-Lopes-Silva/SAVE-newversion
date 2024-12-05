import { connectToMongoDB } from "@/lib/db";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Survey, { ISurveyDocument } from "../../../models/surveyModel";
import { Interface } from "readline";
import Dropdown from "@/components/Dropdown";
import { t } from "i18next"

interface Props {
  surveys: ISurveyDocument[];
}

export default function Public({ surveys }: Props) {
  return (
    <section>
      <main className=" px-20 py-11">
        <div className="rounded-2xl shadow-xl bg-[#ECEFF5] px-7 py-16">
          <h1 className="mb-2 text-3xl  px-9">
            {t('public_data.title')}
            <p className="text-xl py-2">
              {t('public_data.customize')}
            </p>
          </h1>
        </div>
        <div className="flex justify-end py-5">
          <button className="bg-black text-white rounded-2xl w-32 py-1 shadow-sm ">
            {t('public_data.preview')}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl py-10">
            {t('public_data.share')}
          </h1>
        </div>

        <Dropdown></Dropdown>
      </main>
    </section>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectToMongoDB();

  const session = await getSession(context);

  const surveys =
    (await Survey.find({ author: session?.user._id as string })) || [];

  return {
    props: {
      surveys: JSON.parse(JSON.stringify(surveys)),
    },
  };
};
