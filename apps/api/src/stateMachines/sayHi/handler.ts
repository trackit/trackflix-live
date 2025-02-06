export const main = async (event: unknown): Promise<void> => {
  console.log(JSON.stringify(event, null, 2));
};
