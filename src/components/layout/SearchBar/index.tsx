import { CgSearch } from "react-icons/cg";

interface SearchBarProps {
    placeholder: string;
    setSearch: (search: string) => void;
    search: string;
    className: string;
    iconSize: number;
}

export default function SearchBar({ placeholder, setSearch, search, className, iconSize } : SearchBarProps) {
    return (
        <div className={`w-full flex items-center px-3 border border-gray-300 rounded-lg h-10 gap-5 ${className}`}>
            <CgSearch size={iconSize} color="#4C4D5E" />
            <input type="text" value={search} className="w-full dark:bg-transparent dark:text-white h-full min-h-full border-0 outline-none focus:ouline-0 outline-0" placeholder={placeholder} onChange={(e) => setSearch(e.target.value)}/>
        </div>
    )
}