import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function removeParticipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/trips/:tripId/participants/:participantId',
        {
            schema: {
                params: z.object({
                tripId: z.string().uuid(),
                participantId: z.string().uuid(),
                }),
            },
        },

        async (request, reply) => {
            const { tripId, participantId } = request.params;

            const trip = await prisma.trip.findUnique({
                where: {
                    id: tripId,
                }
            });

            if (!trip) throw new ClientError('Trip not found.');
      
            const participant = await prisma.participant.findUnique({
              where: {
                id: participantId,
                trip_id: tripId,
              }
            })
      
            if (!participant) {
              throw new ClientError('Participant not found.')
            }
      
            await prisma.participant.delete({
                where: {
                    id: participantId,
                    trip_id: tripId,
                }
            });

            return reply.status(200).send({
                message: 'Participant removed.'
            });
          },
    );
}
