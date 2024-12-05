
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
};

export default function Button({ children, variant = 'primary',...props }: Props) {

    const variants = {
        primary: 'flex items-center gap-5 hover:text-gray-300 bg-zinc-800 hover:shadow-lg text-white font-medium text-md py-2 px-4 rounded-lg',
        secondary: 'bg-white hover:shadow-md text-black font-bold py-2 px-4 rounded',
        tertiary: 'bg-transparent hover:shadow-md text-black font-bold py-2 px-4 rounded',
    };

    return (
        <button className={`${variants[variant]}`} {...props}>
            {children}
        </button>
    );
}