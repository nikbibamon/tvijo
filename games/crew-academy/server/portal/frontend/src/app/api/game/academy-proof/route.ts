import {authorizeCrew} from '@/lib/crew-handoff';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export function POST(request:Request){
  return authorizeCrew(request,{signingPem:process.env.CREW_TVIJO_SIGNING_PEM,subjectKey:process.env.CREW_TVIJO_SUBJECT_KEY});
}
