-- https://gist.github.com/hamishforbes/1bdc679893eabbbab3bd
-- https://groups.google.com/forum/#!topic/openresty-en/lwTs36YCCZM

function updateForDomain(meta, domain) 
    local velvetrope = ngx.shared["velvetrope_" .. domain]
    if velvetrope == nil then
        return 0
    end

    local keys, err = velvetrope:get_keys(0)
    if not err then
      meta:set(domain .. "_num_users", #keys, 20)
      return #keys
    else
      ngx.log(ngx.DEBUG, "couldn't read velvetrope dict")
      return 0
    end
end

function updateUserCount(premature)
        if premature then
          return
        end
        -- Set timer immediately so it will always run on the 10s mark
        local ok, err = ngx.timer.at(1, updateUserCount)
        if not ok then
            ngx.log(ngx.ERR, "Failed to start background thread: "..err)
        end
        local meta = ngx.shared["velvetrope_metadata"]

        local lock, err = meta:add("flag", ngx.worker.pid(), 30)
        if lock then
            ngx.log(ngx.DEBUG, ngx.worker.pid(), " locked")
            local ukUsers = updateForDomain(meta,'uk')
            local usUsers = updateForDomain(meta,'us')
            local ieUsers = updateForDomain(meta,'ie')
            local auUsers = updateForDomain(meta,'au')
            
            local allUsers = ukUsers + usUsers + ieUsers + auUsers
            ngx.log(ngx.DEBUG, allUsers, " is the no of all users")
            meta:set('all_num_users', allUsers, 20)
            ngx.log(ngx.DEBUG, ngx.worker.pid(), " timer work complete")
            local pid, err = meta:get("flag")
            if pid == ngx.worker.pid() then
                meta:delete("flag")
            else
                ngx.log(ngx.DEBUG, "couldnt release lock")
            end
        else
            if err == "exists" then
                return
            else
                ngx.log(ngx.ERR, err)
            end
        end
    end

local ok, err = ngx.timer.at(1, updateUserCount)
if not ok then
    ngx.log(ngx.ERR, "Failed to start background thread: "..err)
end

function setVelvetRopeDefaults(key, value)
    local meta = ngx.shared["velvetrope_metadata"]
    local result = meta:get(key)
    if not result then
        meta:set(key, value)
    end
end

setVelvetRopeDefaults('disabled', false)
setVelvetRopeDefaults('capacity', 5000)
setVelvetRopeDefaults('denied', 0)
setVelvetRopeDefaults('allowed', 0)