#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_video_file> <output_folder>"
    exit 1
fi

input_video="$1"
output_folder="$2"

# Create the output folder if it doesn't exist
mkdir -p "$output_folder"

# Get the resolution of the input video
resolution=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$input_video")
width=$(echo $resolution | cut -d'x' -f 1)
height=$(echo $resolution | cut -d'x' -f 2)

# Define the resolutions for downscaling
declare -A resolutions=( 
    ["SDR"]="854x480"
    ["HD"]="1280x720"
    ["FHD"]="1920x1080"
)

declare -A bandwidths=(
    ["SDR"]="500000"  # 500 kbps
    ["HD"]="1500000"  # 1.5 Mbps
    ["FHD"]="3000000" # 3 Mbps
)

# Create an empty master playlist file
master_playlist="$output_folder/master.m3u8"
echo "#EXTM3U" > "$master_playlist"

# Iterate over resolutions and convert video
for key in "${!resolutions[@]}"; do
    target_resolution="${resolutions[$key]}"
    target_width=$(echo $target_resolution | cut -d'x' -f 1)
    target_height=$(echo $target_resolution | cut -d'x' -f 2)

    # Only process resolutions lower than the original
    if [ $width -ge $target_width ] && [ $height -ge $target_height ]; then
        output_res_folder="$output_folder/$key"
        mkdir -p "$output_res_folder"

        # Segment the video
        ffmpeg -i "$input_video" -vf "scale=$target_width:$target_height" \
            -c:v libx264 -profile:v main -crf 20 -sc_threshold 0 \
            -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod \
            -hls_segment_filename "$output_res_folder/sequence%03d.m4s" \
            -hls_flags independent_segments \
            -hls_segment_type fmp4 \
            -f hls "$output_res_folder/playlist.m3u8"

        # Add to master playlist
        echo "#EXT-X-STREAM-INF:BANDWIDTH=${bandwidths[$key]},RESOLUTION=$target_resolution" >> "$master_playlist"
        echo "$key/playlist.m3u8" >> "$master_playlist"
    fi
done

