# /bin/bash
find -E . -regex '.*\.(js|map|d\.ts)' -not -path "**/node_modules/*" -delete