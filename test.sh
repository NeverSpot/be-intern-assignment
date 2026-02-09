#!/bin/bash

# Base URLs
BASE_URL="http://localhost:3000/api"
USERS_URL="$BASE_URL/users"
POSTS_URL="$BASE_URL/posts"
FEED_URL="$BASE_URL/feed"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=======================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${BLUE}=======================================${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    echo -e "${BLUE}Request:${NC} $method $endpoint"
    if [ -n "$data" ]; then
        echo -e "${BLUE}Data:${NC} $data"
    fi

    echo -e "${BLUE}Response:${NC}"
    if [ "$method" = "GET" ]; then
        curl -s -X $method "$endpoint" | jq .
    else
        curl -s -X $method "$endpoint" -H "Content-Type: application/json" -d "$data" | jq .
    fi
    echo ""
}

# --- USER FUNCTIONS ---

test_get_all_users() {
    print_header "GET ALL USERS"
    make_request "GET" "$USERS_URL"
}

test_get_user_by_id() {
    print_header "GET USER BY ID"
    read -p "Enter user ID: " id
    make_request "GET" "$USERS_URL/$id"
}

test_create_user() {
    print_header "CREATE USER"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email

    local data;
    data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$data"
}

test_update_user() {
    print_header "UPDATE USER"
    read -p "Enter user ID: " id
    read -p "New first name (leave blank to skip): " firstName
    read -p "New last name (leave blank to skip): " lastName
    read -p "New email (leave blank to skip): " email

    local data="{"
    local first=true
    if [ -n "$firstName" ]; then
        data+="\"firstName\": \"$firstName\""
        first=false
    fi
    if [ -n "$lastName" ]; then
        [ "$first" = false ] && data+=","
        data+="\"lastName\": \"$lastName\""
        first=false
    fi
    if [ -n "$email" ]; then
        [ "$first" = false ] && data+=","
        data+="\"email\": \"$email\""
    fi
    data+="}"

    make_request "PUT" "$USERS_URL/$id" "$data"
}

test_delete_user() {
    print_header "DELETE USER"
    read -p "Enter user ID: " id
    make_request "DELETE" "$USERS_URL/$id"
}

# --- POST FUNCTIONS ---

test_get_all_posts() {
    print_header "GET ALL POSTS"
    make_request "GET" "$POSTS_URL"
}

test_get_post_by_id() {
    print_header "GET POST BY ID"
    read -p "Enter post ID: " id
    make_request "GET" "$POSTS_URL/$id"
}

test_create_post() {
    print_header "CREATE POST"
    read -p "Enter author ID: " authorId
    read -p "Enter content: " content
    read -p "Enter hashtags (comma separated, e.g. tech,news): " tags

    # Convert comma-separated string to JSON array
    local hashtags_json="[]"
    if [ -n "$tags" ]; then
        hashtags_json="["
        IFS=',' read -ra ADDR <<< "$tags"
        local first=true
        for i in "${ADDR[@]}"; do
            [ "$first" = false ] && hashtags_json+=","
            hashtags_json+="\"$(echo $i | xargs | tr -d '\r\n')\""
            first=false
        done
        hashtags_json+="]"
    fi

    local data;
    data=$(cat <<EOF
{
    "authorId": $authorId,
    "content": "$content",
    "hashtags": $hashtags_json
}
EOF
)
    make_request "POST" "$POSTS_URL" "$data"
}

test_delete_post() {
    print_header "DELETE POST"
    read -p "Enter post ID: " id
    make_request "DELETE" "$POSTS_URL/$id"
}

# --- SPECIAL ENDPOINTS ---

test_follow_user() {
    print_header "FOLLOW USER"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    make_request "POST" "$USERS_URL/$followerId/$followingId/follow"
}

test_unfollow_user() {
    print_header "UNFOLLOW USER"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    make_request "POST" "$USERS_URL/$followerId/$followingId/unfollow"
}

test_get_user_activity() {
    print_header "GET USER ACTIVITY"
    read -p "Enter user ID: " id
    read -p "Enter filters (comma separated, e.g. Follow,Post,Like) or leave blank: " filters
    read -p "Enter limit (optional): " limit
    read -p "Enter offset (optional): " offset

    local filter_json="null"
    if [ -n "$filters" ]; then
        filter_json="["
        IFS=',' read -ra ADDR <<< "$filters"
        local first=true
        for i in "${ADDR[@]}"; do
            [ "$first" = false ] && filter_json+=","
            filter_json+="\"$(echo $i | xargs | tr -d '\r\n')\""
            first=false
        done
        filter_json+="]"
    fi

    local data="{\"filter\": $filter_json"
    if [ -n "$limit" ]; then
        data+=", \"limit\": $limit"
    fi
    if [ -n "$offset" ]; then
        data+=", \"offset\": $offset"
    fi
    data+="}"
    make_request "POST" "$USERS_URL/$id/activity" "$data"
}

test_get_user_followers() {
    print_header "GET USER FOLLOWERS"
    read -p "Enter user ID: " id
    read -p "Enter limit (optional): " limit
    read -p "Enter offset (optional): " offset

    local url="$USERS_URL/$id/followers"
    local query=""
    if [ -n "$limit" ]; then
        query="limit=$limit"
    fi
    if [ -n "$offset" ]; then
        if [ -n "$query" ]; then
            query+="&offset=$offset"
        else
            query="offset=$offset"
        fi
    fi

    if [ -n "$query" ]; then
        url+="?$query"
    fi

    make_request "GET" "$url"
}

test_like_post() {
    print_header "LIKE POST"
    read -p "Enter post ID: " postId
    read -p "Enter user ID: " userId
    make_request "POST" "$POSTS_URL/$postId/like/$userId"
}

test_get_posts_by_hashtag() {
    print_header "GET POSTS BY HASHTAG"
    read -p "Enter hashtag: " tag
    read -p "Enter limit (optional): " limit
    read -p "Enter offset (optional): " offset

    local data="{}"
    if [ -n "$limit" ] || [ -n "$offset" ]; then
        data="{"
        local first=true
        if [ -n "$limit" ]; then
            data+="\"limit\": $limit"
            first=false
        fi
        if [ -n "$offset" ]; then
            [ "$first" = false ] && data+=","
            data+="\"offset\": $offset"
        fi
        data+="}"
    fi

    make_request "POST" "$POSTS_URL/hashtag/$tag" "$data"
}

test_get_feed() {
    print_header "GET USER FEED"
    read -p "Enter user ID: " userId
    read -p "Enter limit (optional): " limit
    read -p "Enter offset (optional): " offset

    local data="{\"userId\": $userId"
    if [ -n "$limit" ]; then
        data+=", \"limit\": $limit"
    fi
    if [ -n "$offset" ]; then
        data+=", \"offset\": $offset"
    fi
    data+="}"

    make_request "POST" "$FEED_URL" "$data"
}

# --- MENUS ---

show_user_menu() {
    while true; do
        echo -e "\n${GREEN}--- USER SUBMENU ---${NC}"
        echo "1. Get all users"
        echo "2. Get user by ID"
        echo "3. Create user"
        echo "4. Update user"
        echo "5. Delete user"
        echo "6. Back to main menu"
        read -p "Choice: " choice
        case $choice in
            1) test_get_all_users ;;
            2) test_get_user_by_id ;;
            3) test_create_user ;;
            4) test_update_user ;;
            5) test_delete_user ;;
            6) break ;;
            *) echo -e "${RED}Invalid choice${NC}" ;;
        esac
    done
}

show_post_menu() {
    while true; do
        echo -e "\n${GREEN}--- POST SUBMENU ---${NC}"
        echo "1. Get all posts"
        echo "2. Get post by ID"
        echo "3. Create post"
        echo "4. Delete post"
        echo "5. Back to main menu"
        read -p "Choice: " choice
        case $choice in
            1) test_get_all_posts ;;
            2) test_get_post_by_id ;;
            3) test_create_post ;;
            4) test_delete_post ;;
            5) break ;;
            *) echo -e "${RED}Invalid choice${NC}" ;;
        esac
    done
}

show_special_menu() {
    while true; do
        echo -e "\n${GREEN}--- SPECIAL ENDPOINTS SUBMENU ---${NC}"
        echo "1. Follow user"
        echo "2. Unfollow user"
        echo "3. Get user activity"
        echo "4. Get user followers"
        echo "5. Like post"
        echo "6. Get posts by hashtag"
        echo "7. Get user feed"
        echo "8. Back to main menu"
        read -p "Choice: " choice
        case $choice in
            1) test_follow_user ;;
            2) test_unfollow_user ;;
            3) test_get_user_activity ;;
            4) test_get_user_followers ;;
            5) test_like_post ;;
            6) test_get_posts_by_hashtag ;;
            7) test_get_feed ;;
            8) break ;;
            *) echo -e "${RED}Invalid choice${NC}" ;;
        esac
    done
}

# --- MAIN LOOP ---

while true; do
    echo -e "\n${GREEN}=== MAIN MENU ===${NC}"
    echo "1. Users"
    echo "2. Posts"
    echo "3. Special Endpoints"
    echo "4. Exit"
    read -p "Choice: " choice
    case $choice in
        1) show_user_menu ;;
        2) show_post_menu ;;
        3) show_special_menu ;;
        4) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
done