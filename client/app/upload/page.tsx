"use client";

import { useState } from "react";
import { Upload as UploadIcon, X, Video, AlertCircle, CheckCircle2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-zinc-400">Share your story with the world (max 5 minutes)</p>
        </div>

        {/* Upload Form */}
        <div className="space-y-6">
          {/* File Upload Area */}
          <Card className="p-8 bg-zinc-900 border-zinc-800">
            {!file ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Drop your video here
                  </h3>
                  <p className="text-zinc-400 mb-6">or click to browse</p>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="video-upload">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-700 cursor-pointer" asChild>
                      <span>
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Select Video File
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-zinc-500 mt-4">
                    Supports: MP4, MOV, AVI (Max duration: 5 minutes)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-violet-600/20 flex items-center justify-center">
                      <Film className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-zinc-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setUploadComplete(false);
                      setUploadProgress(0);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Uploading to MinIO...</span>
                      <span className="text-white font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Complete */}
                {uploadComplete && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertDescription className="text-emerald-500">
                      Video uploaded successfully to MinIO storage!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </Card>

          {/* Video Details */}
          {file && (
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Video Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-zinc-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Give your video a catchy title"
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-zinc-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers about your video..."
                    rows={4}
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-zinc-300">
                      Category
                    </Label>
                    <select
                      id="category"
                      title="Video Category"
                      className="mt-1.5 w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white"
                    >
                      <option>Gaming</option>
                      <option>Music</option>
                      <option>Education</option>
                      <option>Comedy</option>
                      <option>Tech</option>
                      <option>Cooking</option>
                      <option>Fitness</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="visibility" className="text-zinc-300">
                      Visibility
                    </Label>
                    <select
                      id="visibility"
                      title="Video Visibility"
                      className="mt-1.5 w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white"
                    >
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Info */}
          <Alert className="bg-blue-500/10 border-blue-500/50">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-500">
              <strong>Warning</strong> Videos can not exceed 300 seconds (5 minutes). Invalid files will not be uploaded.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          {file && (
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={simulateUpload}
                disabled={uploading || uploadComplete}
              >
                {uploading ? "Uploading..." : uploadComplete ? "Uploaded" : "Publish Video"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => {
                  setFile(null);
                  setUploadComplete(false);
                  setUploadProgress(0);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Guidelines */}
        <Card className="mt-8 p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
          <ul className="space-y-2 text-zinc-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Videos must be less than 5 minutes (300 seconds)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Supported formats: MP4, MOV, AVI</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Files are stored securely in MinIO S3-compatible storage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Metadata is validated using Zod before saving to MongoDB</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Presigned URLs ensure your content remains private</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
