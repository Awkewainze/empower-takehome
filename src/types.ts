export type OurJWT = {
	userId: number,
	username: string,
	name: string
};

export namespace API {
	export type User = {
		id: number,
		name: string,
		created_at: Date,
		last_updated_at: Date
	};
	export type Note = {
		id: number,
		user_id: number,
		name: string,
		body: string,
		created_at: Date,
		last_updated_at: Date
	};
}

export type Callback = () => void;
export type Predicate<T> = (value: T) => boolean;
export type Provider<T> = () => T;
export type Consumer<T> = (value: T) => void;
export type Mapper<T, U> = (value: T) => U;
export type AsyncCallback = () => Promise<void>;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type AsyncProvider<T> = () => Promise<T>;
export type AsyncConsumer<T> = (value: T) => Promise<void>;
export type AsyncMapper<T, S> = (value: T) => Promise<S>;