import type { UserProfile } from "../../types/profile";

interface ProfileHeaderCardProps {
  profile: UserProfile;
}

const ProfileHeaderCard = ({ profile }: ProfileHeaderCardProps) => {
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4">
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="h-14 w-14 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0663EA]/10 text-base font-bold text-[#0663EA]">
          {initials}
        </div>
      )}

      <div>
        <span className="block text-base font-bold text-slate-900">{profile.name}</span>
        <span className="block text-sm text-gray-500">
          Primary: {profile.primaryNeighborhood}
        </span>
      </div>
    </div>
  );
};

export default ProfileHeaderCard;