import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"

export function ThemeToggle() {
    const { toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 px-0 border-emerald-300/50 hover:bg-emerald-100/50 dark:border-emerald-700/50 dark:hover:bg-emerald-900/30"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-emerald-700 dark:text-emerald-400" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-emerald-700 dark:text-emerald-400" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
