import { assertOrThrow } from '../utils'
import { getPostsBySectionInRange, getPostInRange, addDistanceInformationToPosts } from '../services/postsInRange'

export async function readAll(req, res) {
    const { offset = 0, limit = 20, myVoteInclude = true } = req.query
    const { latitude, longitude, section } = req.query
    const { user } = res.locals

    const posts = await getPostsBySectionInRange(
        section, { longitude, latitude }, { offset, limit }
    )

    const rawPosts = posts.rows.map(p => p.toJSON())

    if (myVoteInclude) {
        const { PostVote } = req.app.get('models')
        const myVotes = await PostVote.findAll({
            where: {
                postId: rawPosts.map(p => p.id),
                userId: user.id
            }
        })

        rawPosts.map((rawPost) => {
            const myVote = myVotes.filter(vote => vote.postId === rawPost.id)[0]
            rawPost.myVote = (myVote && myVote.value) ? myVote.value : 0
        })
    }

    const postsWithDistance = addDistanceInformationToPosts({ longitude, latitude }, rawPosts)

    res.json(Object.assign({ rows: postsWithDistance }, { offset, limit, count: posts.count.length }))
}

export async function readOne(req, res) {
    // TODO: Fetch latitude, longtitude from ip api or get it from user - to discuss
    const { user } = res.locals
    const { latitude, longitude } = req.query
    const { id } = req.params
    const { PostVote } = req.app.get('models')

    const post = await getPostInRange(id, { latitude, longitude })

    assertOrThrow(post, Error, 'Post not found')

    const rawPost = post.toJSON()

    const myVote = await PostVote.findOne({
        where: {
            postId: rawPost.id,
            userId: user.id
        }
    })

    rawPost.myVote = (myVote && myVote.value) ? myVote.value : 0

    res.json(post)
}

export async function create(req, res) {
    const { title, content, photoUrl, latitude, longitude } = req.body
    const { user } = res.locals
    const { Post, PostLocation } = req.app.get('models')

    const post = await Post.create({
        title,
        content,
        userId: user.id,
        photoUrl
    })

    const postLocation = await PostLocation.create({
        postId: post.id,
        latitude,
        longitude
    })

    res.json({ post, postLocation })
}

export async function putPostPhoto(req, res) {
    const { Post, UserUpload } = req.app.get('models')
    const { user } = res.locals
    const { id } = req.params

    const post = await Post.findOne({ id })
    assertOrThrow(post, Error, 'Post not found')

    const file = res.locals.files[0]
    let photoUrl = null

    if (file) {
        await UserUpload.create({
            uploadUrl: file.url,
            publicId: file.public_id,
            userId: user.id
        })
        photoUrl = file.url
    } else {
        // delete ?
    }

    post.photoUrl = photoUrl
    await post.save()

    res.json({ ok: 'success' })
}

export async function update(req, res) {
    res.send('NOT IMPLEMENTED')
}

export async function remove(req, res) {
    res.send('NOT IMPLEMENTED')
}
