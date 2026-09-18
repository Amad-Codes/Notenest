/**
 * A consistent shape for every successful JSON response the API sends.
 * Keeping this uniform makes the frontend's API client simple and
 * predictable: `{ success, message, data }` every time.
 */
export class ApiResponse<T> {
  public readonly success = true;
  constructor(
    public readonly message: string,
    public readonly data: T
  ) {}
}
