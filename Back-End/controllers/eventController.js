import { events } from '../models/eventModel.js';

export const getEvents = (req, res) => {
  res.json(events);
};
