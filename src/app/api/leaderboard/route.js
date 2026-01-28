import { prisma } from '../../../lib/prisma'; // Adjust the path as necessary

export async function GET(req) {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        voteCount: 'desc', // Sort by vote count descending
      },
      take: 10, // Fetch top 10 submissions
      select: {
        id: true,
        voteCount: true,
        createdAt: true,
        profilepic: true,
        participantId: true,
        participant: {
          select: {
            name: true,
            talent: true,
          }
        }
      },
    });

    const leaderboard = submissions.map(sub => ({
      id: sub.id,
      name: sub.participant?.name || 'Unknown',
      participantTalent: sub.participant?.talent || 'Unknown',
      voteCount: sub.voteCount,
      createdAt: sub.createdAt,
      profilepic: sub.profilepic,
      participantId: sub.participantId,
    }));

    return new Response(JSON.stringify(leaderboard), { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
