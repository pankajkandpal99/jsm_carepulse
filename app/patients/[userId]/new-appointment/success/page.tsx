import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { getUser } from "@/lib/actions/patient.actions";

const Success = async ({
  params: { userId },
  searchParams,
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);
  const doctor = Doctors.find(
    (doc) => doc.name === appointment.primaryPhysician
  );

  const user = await getUser(userId);
  Sentry.metrics.set("user_view_appointmnt-success", user.name); // how many users view registered page...

  return (
    <div className="flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <Link href={"/"}>
          <Image
            src="/assets/icons/logo-full.svg"
            alt="logo"
            height={1000}
            width={1000}
            className="h-10 w-fit"
          />
        </Link>

        <section>
          <Image
            src="/assets/gifs/success.gif"
            alt="success"
            height={300}
            width={280}
          />
        </section>

        <h2 className="header mb-6 max-w-[600px] text-center">
          Your <span className="text-green-500">appointment request</span> has
          been successfullly submitted!
        </h2>

        <p className="">We will be in touch shortly to confirm.</p>

        <section className="request-details">
          <p className="">Requested appointment details:</p>
          <div className="flex items-center gap-3">
            <Image
              src={doctor?.image || ""}
              alt="doctor"
              width={100}
              height={100}
              className="size-6"
            />
            <p className="whitespace-nowrap">Dr. {doctor?.name}</p>
          </div>

          <div className="flex gap-2">
            <Image
              src="/assets/icons/calendar.svg"
              alt="calendar"
              height={24}
              width={24}
            />
            <p className="">{formatDateTime(appointment.schedule).dateTime}</p>
          </div>
        </section>

        <Button variant="outline" className="shad-primary-btn" asChild>
          <Link href={`/patients/${userId}/new-appointment`}>
            New Appointment
          </Link>
        </Button>

        <p className="copyright">&copy; 2024 CarePulse</p>
      </div>
    </div>
  );
};

export default Success;
