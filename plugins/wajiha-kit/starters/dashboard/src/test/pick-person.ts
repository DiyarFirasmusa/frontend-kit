import { screen, type userEvent } from './render';

type UserEvent = ReturnType<typeof userEvent.setup>;

/** Opens a PersonSelectField by its label and picks the option with that name. */
export async function pickPerson(
  user: UserEvent,
  label: string | RegExp,
  name: string | RegExp,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: label }));
  await user.click(await screen.findByRole('option', { name }));
}
