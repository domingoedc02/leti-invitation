declare global {
	namespace App {
		/** Shallow-routing state: whether the guest has opened the invitation. */
		interface PageState {
			opened?: boolean;
		}
	}
}

export {};
