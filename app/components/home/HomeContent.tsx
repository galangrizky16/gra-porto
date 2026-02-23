import { createClient } from "@/app/lib/supabase/server";
import HomeContentClient from "./HomeContentClient";

type Profile = {
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
};

type Skill = {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

const fallbackProfile: Profile = {
  name: "Galang Rizky Arridho",
  location: "Jakarta Timur, Indonesia",
  work_type: "Onsite",
  bio_1: "",
  bio_2: "",
};

export default async function HomeContent() {
  const supabase = await createClient();

  const [{ data: profileData }, { data: skillsData }] = await Promise.all([
    supabase.from("home_profile").select("*").single(),
    supabase.from("home_skills").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const initialProfile = (profileData as Profile | null) ?? fallbackProfile;
  const initialSkills = (skillsData as Skill[] | null) ?? [];

  return (
    <HomeContentClient
      initialProfile={initialProfile}
      initialSkills={initialSkills}
    />
  );
}