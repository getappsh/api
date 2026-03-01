# Define the base URL for the Docker images
BASE_URL="harbor.getapp.sh/getapp-dev"

# Create a directory to store the tar files
mkdir -p getapp_tar

# List of Docker images and their tags
IMAGES=(
    "api:1.0.168"
    "offering:1.1.8"
    "discovery:1.1.1"
    "project-managment:1.1.1"
    "upload:1.1.6"
    "delivery:1.1.5"
    "deploy:1.1.5"
)
# Function to pull and save a Docker image
pull_and_save_image() {
    IMAGE_TAG="$1"
    IMAGE_NAME=$(echo $IMAGE_TAG | cut -d: -f1)
    IMAGE_TAG=$(echo $IMAGE_TAG | cut -d: -f2)

    docker pull "$BASE_URL/$IMAGE_NAME:$IMAGE_TAG"
    docker save -o "getapp_tar/$IMAGE_NAME-$IMAGE_TAG.tar" "$BASE_URL/$IMAGE_NAME:$IMAGE_TAG"
}

# Loop through the list of images and tags and run the function in the background
for IMAGE_TAG in "${IMAGES[@]}"; do
    pull_and_save_image "$IMAGE_TAG" &
done

# Wait for all background processes to complete
wait

echo "Docker images saved as tar files in 'getapp_tar' directory."