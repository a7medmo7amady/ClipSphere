import tkinter as tk
from tkinter import *
import yt_dlp
from tkinter import messagebox, filedialog

def Widgets():
    head_label = Label(root, text="YouTube Video Downloader", padx=15, pady=15, font="SegoeUI 14", bg="white", fg="red")
    head_label.grid(row=1, column=1, pady=10, padx=5, columnspan=3)

    link_label = Label(root, text="YouTube link:", bg="red", pady=7, padx=5)
    link_label.grid(row=2, column=0, pady=5, padx=5)
    root.linkText = Entry(root, width=35, textvariable=video_Link, font="Arial 14")
    root.linkText.grid(row=2, column=1, pady=5, padx=5, columnspan=2)

    destination_label = Label(root, text="Destination:", bg="red", pady=5, padx=9)
    destination_label.grid(row=3, column=0, pady=5, padx=5)
    root.destinationText = Entry(root, width=27, textvariable=download_Path, font="Arial 14")
    root.destinationText.grid(row=3, column=1, pady=5, padx=5)

    browse_B = Button(root, text="Browse", command=Browse, width=10, bg="yellow", relief=GROOVE)
    browse_B.grid(row=3, column=2, pady=1, padx=1)

    Download_B = Button(root, text="Download Video", command=Download, width=20, bg="blue", pady=10, padx=15, relief=GROOVE, font="Georgia, 13")
    Download_B.grid(row=4, column=1, pady=20, padx=20)

    root.linkText.bind("<Control-v>", paste_from_clipboard)

def paste_from_clipboard(event):
    clipboard_text = root.clipboard_get()
    root.linkText.delete(0, END)
    root.linkText.insert(0, clipboard_text)

def Browse():
    download_Directory = filedialog.askdirectory(initialdir="YOUR DIRECTORY PATH", title="Save Video")
    download_Path.set(download_Directory)

def Download():
    Youtube_link = video_Link.get()
    download_Folder = download_Path.get()

    if not Youtube_link:
        messagebox.showerror("Error", "Please enter a YouTube link.")
        return
    if not download_Folder:
        messagebox.showerror("Error", "Please select a download folder.")
        return

    try:
        ydl_opts = {
            "outtmpl": f"{download_Folder}/%(title)s.%(ext)s",
            "format": "bestvideo+bestaudio/best",
            "merge_output_format": "mp4",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([Youtube_link])

        root.clipboard_clear()
        root.clipboard_append(Youtube_link)
        root.update()

        messagebox.showinfo("Download Success", "Video Downloaded Successfully")
    except Exception as e:
        messagebox.showerror("Download Failed", f"An error occurred:\n{e}")
root = tk.Tk()
root.title("YouTube Video Downloader")
video_Link = StringVar()
download_Path = StringVar()
Widgets()
root.mainloop()