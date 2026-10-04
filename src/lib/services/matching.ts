import { IMission } from '@/models/Mission';
import { IUser } from '@/models/User';

export interface MatchScoreResult {
  mission: IMission;
  score: number; // 0 to 100
  distanceKm: number;
  matchedSkills: string[];
  matchReasons: string[];
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function matchHelperToMissions(
  helper: Partial<IUser>,
  missions: IMission[]
): MatchScoreResult[] {
  const helperLat = helper.locationApprox?.coordinates?.[1] || 19.076;
  const helperLon = helper.locationApprox?.coordinates?.[0] || 72.8777;
  const helperSkills = (helper.skills || []).map((s) => s.toLowerCase());

  return missions
    .map((mission) => {
      const missionLat = mission.location?.coordinates?.coordinates?.[1] || 19.0402;
      const missionLon = mission.location?.coordinates?.coordinates?.[0] || 72.8553;
      const distanceKm = calculateDistanceKm(helperLat, helperLon, missionLat, missionLon);

      const matchReasons: string[] = [];

      // Distance score (max 40 pts)
      const distanceScore = Math.max(0, 40 - (distanceKm / 50) * 40);
      matchReasons.push(`${distanceKm} km away from your area`);

      // Skill score (max 40 pts)
      const reqSkills = (mission.requiredSkills || []).map((s) => s.toLowerCase());
      const matchedSkills = reqSkills.filter((s) => helperSkills.includes(s));
      const skillScore = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 40 : 25;

      if (matchedSkills.length > 0) {
        matchReasons.push(`Matches skill: ${matchedSkills.join(', ')}`);
      } else {
        matchReasons.push(`Requires general community support`);
      }

      // Urgency score (max 20 pts)
      let urgencyScore = 10;
      if (mission.urgency === 'CRITICAL') {
        urgencyScore = 20;
        matchReasons.push('Critical urgency priority');
      } else if (mission.urgency === 'HIGH') {
        urgencyScore = 16;
        matchReasons.push('High urgency mission');
      } else if (mission.urgency === 'MEDIUM') {
        urgencyScore = 12;
      }

      const score = Math.min(100, Math.round(distanceScore + skillScore + urgencyScore));

      return {
        mission,
        score,
        distanceKm,
        matchedSkills,
        matchReasons,
      };
    })
    .sort((a, b) => b.score - a.score);
}
